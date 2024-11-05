import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useMain } from './hooks/useMainContract'
import { useTonConnect } from './hooks/useTonConnect';
import { fromNano } from '@ton/core';


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

          <div className='buttonContainer'>
            {connected && (
              <a onClick={() => {
                sendIncrement()
              }} className='incrementButton'>Increment by 1</a>
            )}


            {connected && (
              <a onClick={() => {
                sendDeposit()
              }} className='depositButton'>Deposit 0.5 TON</a>
            )}


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
