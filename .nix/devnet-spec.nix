
{ pkgs,
  composable,
  polkadot,
}:
let
  description = "Specification builder for target runner of relay chain and relevant parachains and relevant information";
  polkadot-launch = pkgs.callPackage ../scripts/polkadot-launch/polkadot-launch.nix { };
  polkadot-bin = pkgs.callPackage ./polkadot-bin.nix { inherit polkadot; };
  composable-bin = pkgs.callPackage ./composable-bin.nix { inherit composable; };
  composable-book = pkgs.callPackage ./composable-book.nix { inherit composable; };

  # TODO: move this builder to polkadot-launch folder
  make-node = tmp-directory: node-type: { name, wsPort, port }: {
    inherit name;
    inherit wsPort;
    inherit port;
    basePath = "${tmp-directory}/${node-type}/${name}";
  };

  # TODO: move this builder out and allow to make second other parachain
  make-polkalaunch-config =
    { tmp-directory, relaychain-spec, relaychain-bin, parachain-spec, parachain-bin }: {
      relaychain = {
        bin = relaychain-bin;
        chain = relaychain-spec;
        nodes = map (make-node tmp-directory "relaychain") polkadot.nodes;
        # TODO: use override pattern
        flags = [
          "--rpc-cors=all"
          "--beefy"
          "--enable-offchain-indexing=true"
        ];
      };
      parachains = [
        {
          bin = parachain-bin;
          balance = "1000000000000000000000";
          chain = parachain-spec;
          nodes =
            map (node:
              (make-node tmp-directory "parachain" node) // {
                flags = 
                [
                  "--" 
                  "--unsafe-ws-external"
                  "--rpc-cors=all"
                  "--execution=wasm"
                  "--wasmtime-instantiation-strategy=recreate-instance-copy-on-write"
                  ];
              }) composable.nodes;
        }
      ];
      types = {};
      finalization = false;
      simpleParachains = [];
    };

  tmp-directory = "/tmp/polkadot-launch";

  devnet-polkalaunch-config =
    pkgs.writeTextFile {
      name = "devnet-polkalaunch.json";
      text = builtins.toJSON (
        make-polkalaunch-config
          { 
            inherit tmp-directory;
            relaychain-spec = polkadot.chain;
            relaychain-bin = "${polkadot-bin}/bin/polkadot";
            parachain-spec = composable.chain;
            parachain-bin = "${composable-bin}/bin/composable";
          }
      );
    };
in {
  script =
    pkgs.writeShellScriptBin "run-${composable.chain}" ''
      rm -rf ${tmp-directory}
      ${polkadot-launch}/bin/polkadot-launch ${devnet-polkalaunch-config}
    '';
  documentation = "${composable-bin}/share";
  
  inherit 
    composable
    polkadot
    composable-book;
}