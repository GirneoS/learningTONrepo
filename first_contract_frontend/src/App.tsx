import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useMain } from './hooks/useMainContract'
import { useTonConnect } from './hooks/useTonConnect';

// kQAid95MyL0q_h9FPC6HvJGnG42nmCEc_KJvjoC6w2RNLRg7

function App() {
  const {
    counterValue,
    recentSender,
    ownerAddress,
    contractAddress,
    contractBalance,
    sendIncrement
  } = useMain();

  const { connected } = useTonConnect();

  return (
    <div>
      <div className='App'>
        <TonConnectButton />
      </div>
      <div>
        <div className=' Card'>
        <b>Our contract Address</b>
        <div className='Hint'>{contractAddress?.slice(0, 30) +"..."}</div> <b>Our contract Balance</b>
        <div className='Hint'>{contractBalance}</div>
        </div>
        <div className='Card'>
        <b>Counter Value</b>
        <div>{counterValue ?? "Loading……"}</div> </div>
      </div>

      {connected && (
        <a onClick={() => {
          sendIncrement()
        }}>Increment by 5</a>
      )}
    </div>
  )
}

export default App
