import { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import algosdk, { getApplicationAddress, makePaymentTxnWithSuggestedParamsFromObject } from 'algosdk'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { BankClient as ContribChainClient, BankFactory as ContribChainFactory } from "../contracts/Bank";

import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

type Statement = {
  id: string
  round: number
  amount: number
  type: 'deposit' | 'withdrawal'
  sender: string
  receiver: string
}

export const ContribChain = ({ openModal, closeModal }: any) => {

  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()

  const algorand = useMemo(
    () => AlgorandClient.fromConfig({ algodConfig, indexerConfig }),
    [algodConfig, indexerConfig]
  )

  const [appId, setAppId] = useState<number | ''>(0)
  const [deploying, setDeploying] = useState(false)

  // NEW PHASE 3
  const [taskDescription, setTaskDescription] = useState('')
  const [hours, setHours] = useState('')

  const [loading, setLoading] = useState(false)
  const [statements, setStatements] = useState<Statement[]>([])
  const [depositors, setDepositors] = useState<Array<{ address: string; amount: string }>>([])

  useEffect(() => {
    algorand.setDefaultSigner(transactionSigner)
  }, [algorand, transactionSigner])

  const appAddress = useMemo(
    () => (appId && appId > 0 ? String(getApplicationAddress(appId)) : ''),
    [appId]
  )

  // ───────── DEPLOY CONTRACT ─────────
  const deployContract = async () => {
    try {
      if (!activeAddress) throw new Error('Connect wallet first')

      setDeploying(true)

      const factory = new ContribChainFactory({
        defaultSender: activeAddress,
        algorand,
      })

      const result = await factory.send.create.bare()

      const newId = Number(result.appClient.appId)
      setAppId(newId)

      enqueueSnackbar(`Deployed! App ID: ${newId}`, { variant: 'success' })

    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setDeploying(false)
    }
  }

  // ───────── LOG CONTRIBUTION (OLD DEPOSIT LOGIC) ─────────
  const handleLogContribution = async () => {
    try {
      if (!activeAddress) throw new Error('Connect wallet')
      if (!appId) throw new Error('Enter App ID')

      const amountAlgos = Number(hours || 1)
      const amountMicroAlgos = Math.round(amountAlgos * 1000000)

      setLoading(true)

      const sp = await algorand.client.algod.getTransactionParams().do()
      const appAddr = getApplicationAddress(appId)

      const payTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: appAddr,
        amount: amountMicroAlgos,
        suggestedParams: sp,
      })

      const client = new ContribChainClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: transactionSigner,
      })

      await client.send.deposit({
        args: {
          memo: taskDescription,
          payTxn: { txn: payTxn, signer: transactionSigner },
        },
        sender: activeAddress,
      })

      enqueueSnackbar('Contribution Logged!', { variant: 'success' })

      setTaskDescription('')
      setHours('')

    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // ───────── UI ─────────
  return (
    <dialog className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form className="modal-box max-w-3xl">

        <h3 className="font-bold text-lg">ContribChain Contract</h3>

        {/* ===== APP SETUP ===== */}
        <div className="bg-white p-4 rounded mt-2">

          <label className="text-sm">Application ID</label>

          <input
            className="input input-bordered w-full mb-2"
            type="number"
            value={appId}
            onChange={(e) =>
              setAppId(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="Enter deployed App ID"
          />

          {appAddress && (
            <div className="alert alert-info text-xs break-all mb-2">
              App Address: {appAddress}
            </div>
          )}

          <button
            className="btn btn-accent"
            disabled={!activeAddress || deploying}
            onClick={(e) => {
              e.preventDefault()
              void deployContract()
            }}
          >
            Deploy ContribChain
          </button>
        </div>

        {/* ===== LOG CONTRIBUTION ===== */}
        <div className="bg-white p-4 rounded mt-4">

          <h3 className="font-semibold mb-2">Log Contribution</h3>

          <input
            className="input input-bordered w-full mb-2"
            placeholder="Task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <input
            className="input input-bordered w-full mb-2"
            type="number"
            placeholder="Hours worked"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />

          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              void handleLogContribution()
            }}
          >
            Log Contribution
          </button>
        </div>

        <div className="divider">Contribution History</div>
        <p className="text-sm">No transactions found.</p>

        <div className="divider">Team Members</div>
        <p className="text-sm">No members yet.</p>

        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Close
          </button>
        </div>

      </form>
    </dialog>
  )
}

export default ContribChain

