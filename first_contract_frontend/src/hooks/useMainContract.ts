import { useEffect, useState } from "react";
import { Main } from "../contracts/Main";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";

export function useMain() {
    const client = useTonClient();

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
        }
        getValue();
    }, [main]);

    return {
        contractAddress: main?.address.toString(),
        contractBalance: balance,
        ...contractData,
    }
}