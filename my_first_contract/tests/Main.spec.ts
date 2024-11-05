import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Main } from '../wrappers/Main';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Main', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Main');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let main: SandboxContract<Main>;
    let initWallet: SandboxContract<TreasuryContract>;
    let ownerWallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        initWallet = await blockchain.treasury('initAddress');
        ownerWallet = await blockchain.treasury('ownerWallet');

        main = blockchain.openContract(
            Main.createFromConfig({
                number: 0,
                address: initWallet.address,
                owner_address: ownerWallet.address,
            },
            code));

        deployer = await blockchain.treasury('deployer');
    });

    it('should deploy', async () => {
        const deployResult = await main.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: main.address,
            deploy: true,
        });
    });

    it("successfully deposits funds", async () => {
        const senderWallet = await blockchain.treasury('senderWallet');

        const depositMessageResult = await main.sendDeposit(
            senderWallet.getSender(),
            toNano('5')
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: main.address,
            success: true
        });

        const balanceRequest = await main.getBalance();

        expect(balanceRequest.balance).toBeGreaterThan(toNano('4.99'));
    });

    it("should return deposit if there is not operation code", async () => {
        const senderWallet = await blockchain.treasury('senderWallet');

        const depositMessageResult = await main.sendNoCodeDeposit(
            senderWallet.getSender(),
            toNano('5')
        );

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: main.address,
            success: false
        });

        const balanceRequest = await main.getBalance();

        expect(balanceRequest.balance).toEqual(0);
    });
    
    it("should withdraw fund if owner requests", async () => {
        const senderWallet = await blockchain.treasury('senderWallet');

        const depositRequest = await main.sendDeposit(
            senderWallet.getSender(),
            toNano('5')
        )

        expect(depositRequest.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: main.address,
            success: true
        })

        const withdrawRequest = await main.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano('0.05'), //на комиссию
            toNano(3)
        )

        expect(withdrawRequest.transactions).toHaveTransaction({ //мы ищем транзакцию, в которой контракт отдает овнеру запрошенные токены
            from: main.address,
            to: ownerWallet.address,
            success: true,
            value: toNano(3)
        });
    });

    it("shouldn't make withdraw if this request isn't from owner", async () => {
        const senderWallet = await blockchain.treasury('senderWallet');

        const depositRequest = await main.sendDeposit(
            senderWallet.getSender(),
            toNano('5')
        );

        expect(depositRequest.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: main.address,
            success: true
        });    

        const withdrawRequestFromSender = await main.sendWithdrawalRequest(
            senderWallet.getSender(),
            toNano('0.05'),
            toNano('3'),
        );

        expect(withdrawRequestFromSender.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: main.address,
            success: false,
            exitCode: 103,
        })
    });

    it("Should throw 104 error if there is no enough money to withdraw", async () => {
        const withdrawRequest = await main.sendWithdrawalRequest(
            ownerWallet.getSender(),
            toNano('0.05'),
            toNano(1)
        );

        expect(withdrawRequest.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: main.address,
            success: false,
            exitCode: 104
        })
    });

});
