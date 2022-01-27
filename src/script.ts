import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { options } from '@acala-network/api'

const PHRASE = 'time copper course profit all pledge priority illegal please couch nest glance'
const Receiver = '5ED8PaU5m2gQoaASMzrF7JrcJMfj4yZMBPaUY84VjozyTo7Y'
const url = 'wss://mandala.polkawallet.io'

async function main() {

    let api = await connectionCreator(url)

    const keyring = new Keyring({ type: 'sr25519' })
    const newPair = keyring.addFromUri(PHRASE)

    const balance_before_transfer = await print_current_balance(api, newPair)

    //make a transfer
    await api.tx.currencies.transfer(Receiver, {'token': 'DOT'}, 100000000).signAndSend(newPair)

    await api.disconnect()
    api = await connectionCreator(url)

    api.query.tokens.accounts(newPair.address, {'token': 'DOT'}, ({ free }) => {
        console.log(`Balance from subscripttion is ${free}`)
        if (balance_before_transfer.toString() != free.toString()){
            throw new Error("Try again, it's happening 1/5 tymes")
        }
    });

    const interval = setInterval(doStuff, 1000)

    await delay(60000)
    console.log(`I can't fetch balance by subscription, let's reconnect and do it again...`)
    clearInterval(interval)
    await api.disconnect()
    api = await connectionCreator(url)
    await print_current_balance(api, newPair)

    return
}

async function connectionCreator(url: string): Promise<ApiPromise> {
    const provider = new WsProvider(url)
    return ApiPromise.create(options({provider}))
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const print_current_balance = (api, keyPair) => new Promise(async resolve => {
    await api.query.tokens.accounts(keyPair.address, {'token': 'DOT'}, ({free}) => {
        console.log(`Curent balance is ${free}`)
        resolve(free)
    })
})

function doStuff() {
    console.count('Seconds after subscription')
 }

main().catch(console.error).finally()
