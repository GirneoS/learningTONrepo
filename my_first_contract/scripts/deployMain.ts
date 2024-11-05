import { address, toNano } from '@ton/core';
import { Main } from '../wrappers/Main';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const codeCell = await compile('Main');

    
    const contract = await Main.createFromConfig({
        number: 0,
        address: address("0QCMqPYolZZbAcNPqx9op7zo0WlEqCBsHpY1-HC4Oqc0XSdM"),
        owner_address: address("0QCMqPYolZZbAcNPqx9op7zo0WlEqCBsHpY1-HC4Oqc0XSdM"),
    },
    codeCell);

    const main = provider.open(contract);

    await main.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(main.address);

    // run methods on `main`
}
