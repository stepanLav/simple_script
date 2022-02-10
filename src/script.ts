import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { options } from '@acala-network/api'

const PHRASE = 'time copper course profit all pledge priority illegal please couch nest glance'
const Receiver = '5ED8PaU5m2gQoaASMzrF7JrcJMfj4yZMBPaUY84VjozyTo7Y'
const url = 'wss://mandala.polkawallet.io'

async function main() {

    const firstApi = await connectionCreator(url)

    const keyring = new Keyring({ type: 'sr25519' })
    const newPair = keyring.addFromUri(PHRASE)

    let count = 0
    //subscribe to the balance from first connection
    firstApi.query.tokens.accounts(newPair.address, { 'token': 'DOT' }, async ({ free }) => {
        console.log(`Balance from subscripttion is ${free}`)

        //Create secon connection
        const secondApi = await connectionCreator(url)

        //make a transfer only one times
        if (++count === 1) {
            await firstApi.tx.currencies.transfer(Receiver, { 'token': 'DOT' }, 100000000).signAndSend(newPair)
        }

        //if subscribe to the balance from second connection immediately after first event it lead to the problem.
        if (count === 2) {
            secondApi.query.tokens.accounts(newPair.address, { 'token': 'DOT' }, async ({ free }) => {
                console.log(`Balance from NEW subscripttion is ${free}`)
            })
        }
    });
}

async function connectionCreator(url: string): Promise<ApiPromise> {
    const provider = new WsProvider(url)
    return ApiPromise.create(options({ provider }))
}

main().catch(console.error).finally()
