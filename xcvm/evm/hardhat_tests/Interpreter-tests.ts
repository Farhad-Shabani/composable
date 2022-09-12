import {ethers, network} from "hardhat";
import {expect} from "chai";
import { encode } from "punycode";

const protobuf = require("protobufjs");


describe("Interpreter", function () {
  let gateway: any;
  let interpreter: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let accounts: any;
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    [owner, user1, user2] = accounts;
    const Interpreter = await ethers.getContractFactory('Interpreter');
    const Gateway = await ethers.getContractFactory('Gateway');
    gateway = await Gateway.deploy()
    //register owner as the bridge
    await gateway.registerBridge(owner.address, 1, 1);
  });


  describe("interpreter with protobuf", function () {
    it("test user protobuf as the serialization protocol", async function () {
      let root = await protobuf.load("./interpreter.proto")
      let ProgramMessage = root.lookupType("interpreter.Program");
      let InstructionMessage = root.lookupType("interpreter.Instruction");
      let InstructionsMessage = root.lookupType("interpreter.Instructions");
      let TransferMessage = root.lookupType("interpreter.Transfer");
      let AssetIdMessage = root.lookupType("interpreter.AssetId");
      let AccountMessage = root.lookupType("interpreter.Account");
      let AssetMessage = root.lookupType("interpreter.Asset");
      let AbsoluteMessage = root.lookupType("interpreter.Absolute");
      let BalanceMessage = root.lookupType("interpreter.Balance");
      
      let accountMessage = AccountMessage.create({account: ethers.utils.arrayify(owner.address)});
      let assetIdMessage = AssetIdMessage.create({assetId: 1});
      let absoluteMessage = AbsoluteMessage.create({value: 100});
      let balanceMessage = BalanceMessage.create({absolute: absoluteMessage}); 

      console.log('owner', owner.address.toString("hex"));
      let asset = AssetMessage.create({assetId: assetIdMessage, balance: balanceMessage});
      console.log("assets", AssetMessage.encode(asset).finish().toString("hex"));
      let transferMessage = TransferMessage.create({account: accountMessage, assets: [asset]});
      console.log("account", AccountMessage.encode(accountMessage).finish().toString("hex"));
      console.log("transfer", TransferMessage.encode(transferMessage).finish().toString("hex"));
      let instructionMessage = InstructionMessage.create(InstructionMessage.toObject({transfer: transferMessage}, {oneofs: true}))
      console.log("instruction", InstructionMessage.encode(instructionMessage).finish().toString("hex"));
      let instructionsMessage = InstructionsMessage.create(InstructionsMessage.toObject({instructions: [instructionMessage]}))
      console.log("instructions", InstructionsMessage.encode(instructionsMessage).finish().toString("hex"));
      console.log(owner.address);
      console.log(InstructionMessage.fromObject(instructionMessage));
      let programMessage = ProgramMessage.create({instructions: instructionsMessage});
      console.log(ProgramMessage.fromObject(programMessage));
      let encodedProgram = "0x" + ProgramMessage.encode(programMessage).finish().toString("hex");
      encodedProgram = ProgramMessage.encode(programMessage).finish()
      console.log(encodedProgram);

      await gateway.runProgram( {networkId: 1, account: owner.address}, encodedProgram, [], []);
      //await gateway.runProgram( {networkId: 1, account: owner.address}, ethers.utils.arrayify(encodedProgram), [], []);

    });
    /*
    it("test user protobuf as the serialization protocol", async function () {
      let PushMessage = root.lookupType("interpreter.Push");
      let PopMessage = root.lookupType("interpreter.Pop");
      let AddMessage = root.lookupType("interpreter.Add");
      let InstructionMessage = root.lookupType("interpreter.Instruction");
      let InstructionsMessage = root.lookupType("interpreter.Instructions");
      let ProgramMessage = root.lookupType("interpreter.Program");
      let pushMessage = PushMessage.create({value: 1});
      console.log(PushMessage.toObject(pushMessage))
      console.log(pushMessage)

      let instructionMessage = InstructionMessage.create(InstructionMessage.toObject({push: pushMessage}, {oneofs: true}))
      console.log(InstructionMessage.fromObject(instructionMessage))

      let pushMessage2 = PushMessage.create({value: 2})
      let instructionMessage2 = InstructionMessage.create(InstructionMessage.toObject({push: pushMessage2}, {oneofs: true}))
      console.log(InstructionMessage.fromObject(instructionMessage2))

      let addMessage = AddMessage.create({})
      let instructionMessage3 = InstructionMessage.create(InstructionMessage.toObject({add: addMessage}, {oneofs: true}))
      console.log(InstructionMessage.fromObject(instructionMessage3))

      let instructionsMessage = InstructionsMessage.create(InstructionsMessage.toObject({instructions: [instructionMessage, instructionMessage2, instructionMessage3]}))
      let programMessage = ProgramMessage.create(ProgramMessage.toObject({instructions: instructionsMessage}));

      let res = ProgramMessage.verify(programMessage);

      let encodedProgram = ProgramMessage.encode(programMessage).finish().toString("hex");
      console.log("encoded program", encodedProgram);
      await machine.dispatch_program("0x" + encodedProgram);

      // check the result
      let interpreterAddress = await machine.userInterpreter(owner.address);
      interpreter = await ethers.getContractAt('Interpreter', interpreterAddress);
      expect(await interpreter.userStack(0)).to.be.equal(3);

      // test again: change value
      let popMessage = PopMessage.create({value: 1});
      instructionMessage = InstructionMessage.create(InstructionMessage.toObject({pop: popMessage}, {oneofs: true}))
      console.log(InstructionMessage.fromObject(instructionMessage))
      instructionMessage2 = InstructionMessage.create(InstructionMessage.toObject({push: pushMessage2}, {oneofs: true}))
      console.log(InstructionMessage.fromObject(instructionMessage2))
      instructionsMessage = InstructionsMessage.create(InstructionsMessage.toObject({instructions: [instructionMessage, instructionMessage2]}))
      programMessage = ProgramMessage.create(ProgramMessage.toObject({instructions: instructionsMessage}));

      encodedProgram = ProgramMessage.encode(programMessage).finish().toString("hex");
      console.log("encoded program", encodedProgram);
      await machine.dispatch_program("0x" + encodedProgram);
      expect(await interpreter.userStack(0)).to.be.equal(2);

    })
  */
  })
});
