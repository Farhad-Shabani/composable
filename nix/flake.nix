{
  description = "Composable Devnet Scripts";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/78dd3171e664c83cf9d969e96e5eed92ea0ad65c";
    flake-utils.url = "github:numtide/flake-utils/3cecb5b042f7f209c56ffd8371b2711a290ec797";
  };
  outputs = { nixpkgs, flake-utils, ... }:
    let
      bins =
        (if builtins.pathExists ./devnet.json
         then builtins.fromJSON (builtins.readFile ./devnet.json)
         else throw "Devnet `devnet.json` definition missing, please follow the README.md instructions.");
      mk-composable = spec: { name, version, hash }: {
        inherit name;
        inherit version;
        inherit spec;
        inherit hash;
        nodes = [{
          name = "alice";
          wsPort = 9944;
          port = 30444;
        } {
          name = "bob";
          wsPort = 9955;
          port = 30555;
        } {
          name = "charlie";
          wsPort = 9966;
          port = 30666;
        } {
          name = "dave";
          wsPort = 9977;
          port = 30777;
        }];
      };
      mk-polkadot = spec: { version, hash }: {
        inherit version;
        inherit spec;
        inherit hash;
        nodes = [{
          name = "alice";
          wsPort = 9988;
          port = 31100;
        } {
          name = "bob";
          wsPort = 9997;
          port = 31200;
        } {
          name = "charlie";
          wsPort = 9996;
          port = 31300;
        }];
      };
      mk-latest = spec:
        ({ composable, polkadot }: {
          composable = mk-composable spec composable;
          polkadot = mk-polkadot "rococo-local" polkadot;
        }) bins;
      latest-dali = mk-latest "dali-dev";
      latest-picasso = mk-latest "picasso-dev";
    in
    {
      nixopsConfigurations.default =
        let
          pkgs-nixos = import nixpkgs {};
          conf = if builtins.pathExists ./ops.json
                 then builtins.fromJSON (builtins.readFile ./ops.json)
                 else throw "Operations credentials `ops.json` definition missng, please follow the README.md instructions.";
          credentials = {
            project = conf.project_id;
            serviceAccount = conf.client_email;
            accessKey = conf.private_key;
          };
        in
          builtins.foldl' (machines: { composable, polkadot }: machines // import ./devnet-gce.nix {
            inherit credentials;
            inherit composable;
            inherit polkadot;
          }) {
            inherit nixpkgs;
            network.description = "Composable Devnet";
            network.storage.legacy = {};
          } [ latest-dali latest-picasso ];
    } //
    flake-utils.lib.eachDefaultSystem
      (system:
        let pkgs = import nixpkgs { inherit system; };
        in rec {
          packages.devnet-dali = (pkgs.callPackage ./devnet.nix {
            inherit (latest-dali) composable;
            inherit (latest-dali) polkadot;
          }).script;
          packages.devnet-picasso = (pkgs.callPackage ./devnet.nix {
            inherit (latest-picasso) composable;
            inherit (latest-picasso) polkadot;
          }).script;
          packages.deploy = pkgs.mkShell {
            buildInputs = [
              packages.devnet-dali
              packages.devnet-picasso
              pkgs.openssh
              (pkgs.nixopsUnstable.override {
                overrides = (self: super: {
                  # FIXME: probably useless once 2.0 is stable
                  nixops = super.nixops.overridePythonAttrs (
                    _: {
                      src = pkgs.fetchgit {
                        url = "https://github.com/NixOS/nixops";
                        rev = "35ac02085169bc2372834d6be6cf4c1bdf820d09";
                        sha256 = "1jh0jrxyywjqhac2dvpj7r7isjv68ynbg7g6f6rj55raxcqc7r3j";
                      };
                    }
                  );
                });
            })];
            # NOTE: nixops depends on nixpkgs for the virtual machine initial conf...
            NIX_PATH = "nixpkgs=${pkgs.path}";
          };
          defaultPackage = packages.devnet-dali;
          devShell = pkgs.mkShell {
            buildInputs = [
              packages.devnet-dali
              packages.devnet-picasso
            ];
          };
        }
      );
}
