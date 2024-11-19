import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useMain } from './hooks/useMainContract'
import { useTonConnect } from './hooks/useTonConnect';
import { beginCell, Cell, CellType, fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';

function App() {
  const {
    counterValue,
    contractAddress,
    contractBalance,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest
  } = useMain();

  const { connected } = useTonConnect();

  const showAlert = () => {
    WebApp.showAlert("Hey, there!");
  }

  return (
    <div>
      <header>
        <p className='warning'>Testnet</p>
        <div className='App'>
          <TonConnectButton />
        </div>
      </header>
      
      <main>
          <div className='infoContainer'>
            <b>{WebApp.platform}</b>
            <div className=' Card'>
            <b>Our contract Address</b>
            <div className='Hint'>{contractAddress?.slice(0, 30) +"..."}</div> <b>Our contract Balance</b>
            {contractBalance && (
                <div className='Hint'>{fromNano(contractBalance)}</div>
            )}
            </div>
            <div className='Card'>
            <b>Counter Value</b>
            <div>{counterValue ?? "Loading……"}</div> </div>
          </div>

          <br/>
          <TextForm />
          <div className='buttonContainer'>
            <a onClick={() => 
              showAlert()
            }>Alert</a>


            {connected && (
              <a onClick={() => {
                sendIncrement()
              }} className='incrementButton'>Increment by 1</a>
            )}

            <br/>

            {connected && (
              <a onClick={() => {
                sendDeposit()
              }} className='depositButton'>Deposit 0.5 TON</a>
            )}

            <br/>

            {connected && (
              <a onClick={() => {
                sendWithdrawalRequest()
              }} className='withdrawButton'>Withdraw funds</a>
            )}
          </div>
      </main>
    </div>
  )
}

export default App

function TextForm() {
  return (
    <form action="submitting text from frontend to smart-contract" onSubmit={handlingNewProposal}>
            <textarea rows={20} cols={50} placeholder='Введите текст proposal' name='text'></textarea>
            <input type='submit'>Create</input>
    </form>
  )
}

function handlingNewProposal(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();


  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const text = formData.get('text') as string;

  if(text != ''){

    let splittedText: string[] = splitTextBySize(text, 125);
    let cellsList: Cell[] = [];
    cellsList.push(beginCell().storeStringTail(splittedText[splittedText.length-1]).storeRef(beginCell().endCell()).endCell());
    for(let i = 1; i < splittedText.length; i++)
      cellsList.push(beginCell().storeStringTail(splittedText[splittedText.length-1-i]).storeRef(cellsList[i-1]).endCell());
    
    let text_root = cellsList[-1];
    //здесь вызывается функция, в которую передается текст и которая отправляет mint message главному контракту
  }else{
    alert("Нужно напечатать текст!!!");
  }

}

//1 - сплитим текст, 2 - формируем ячейки с конца текста

function splitTextBySize(text: string, size: number){
  let substringArray: string[] = [];

  for(let i = 0; i < text.length; i+=size)
    substringArray.push(text.slice(i,i+size));


  return substringArray;
}