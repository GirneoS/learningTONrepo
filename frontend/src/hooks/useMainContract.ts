import { useEffect, useState } from "react";
import { Main } from "../contracts/Main";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { toNano, Cell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function useMain() {
    const client = useTonClient();
    const {sender} = useTonConnect();

    const sleep = (time: number) => 
        new Promise((resolve) => setTimeout(resolve,time));
    

    const [contractData, setContractData] = useState<null | {
        counterValue: number;
        recentSender: Address;
        ownerAddress: Address;
    }>();

    const [balance, setBalance] = useState<null | number>(0);

    const main = useAsyncInitialize(async () => {
        if(!client) return;
        const mainContract = new Main(
            Address.parse("kQAid95MyL0q_h9FPC6HvJGnG42nmCEc_KJvjoC6w2RNLRg7")
        );
        return client.open(mainContract) as OpenedContract<Main>;
    }, [client]);

    useEffect(() => {
        async function getValue(){
            if(!main) return;
            setContractData(null);
            const val = await main.getData();
            const { balance } = await main.getBalance();
            setContractData({
                counterValue: val.number,
                recentSender: val.recent_sender,
                ownerAddress: val.owner_address 
            });
            setBalance(balance);
            await sleep(5000);
            getValue();
        }
        getValue();
    }, [main]);

    return {
        contractAddress: main?.address.toString(),
        contractBalance: balance,
        ...contractData,
        sendIncrement: async () => {
            return main?.sendIncrement(sender, toNano('0.01'), 1);
        },
        sendDeposit: async () => {
            return main?.sendDeposit(sender, toNano('0.5'));
        },
        sendWithdrawalRequest: async () => {
            return main?.sendWithdrawalRequest(sender, toNano('0.01'), toNano('0.3'))
        },
        sendStoreProposalRequest: async (text: Cell) => {
            const val = await main?.getData();
            
            if(val?.last_index==undefined)
                throw(new Error())

            return main?.sendStoreProposalRequest(sender, toNano('0.01'), text, val?.last_index+1)
            
        }
    }
}