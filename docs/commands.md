# Commands

The following commands can be used to interact with the wallet.

## Create Wallet

Create a file that contains all the information of a crypto wallet.

```
digibyte-wallet > create -name my_wallet
```

Find more information [here](create.md).

## Open Wallet

Open an existing wallet

```
digibyte-wallet > open
```

Find more information [here](open.md).

## Close Wallet

Close a wallet

```
my-wallet > close
```

Find more information [here](close.md).

## Generate Address

Generate a new address from the master public key

```
my-wallet > address
my-wallet > Address: DQc3P5g2hhCQrcBNPGu38Di1g9x4ypkjBe
```

Find more information [here](address.md).

## Check balance

Retrive UTXOs information from a public DigiByte full node

```
my-wallet > balance
my-wallet > Confirmed: 1025.556 DGB
my-wallet > Unconfirmed: 0 DGB
my-wallet > Transactions: 3
```

## Show xpub

Get the main HD public key. Derived up to level 3

```
my-wallet > xpub
my-wallet > xpub6CVtAek8yS6tnkQVMkbRWU5sdL6dgrV85oKKads9xYCThfb3tYaiJSVNppEhvwwwpVqx1cfqqhb9KXsqxwHzfsAZBzdVh6Av6DDuLGGRpki
```

## Send Coins

Create a transaction and broadcast it to the network. 

```
my-wallet > send
my-wallet > Available balance: 8570.01255 DGB
my-wallet > Pay to: DN1n37nMviDx4WNYczM4XoT2WXyzbCcvjL
my-wallet > Amount: 430
my-wallet > Password: ****
my-wallet > TXID: dbfc1a9a5da03dc09b6d5abb3ed59022946d30f3e37b10ac0f467ac1488fefea
```

Find more information [here](send.md).

## Search in blockchain

Lookup an address or transaction in the blockchain

```
digibyte-wallet > explorer
digibyte-wallet > Server:  digibyteblockexplorer.com
digibyte-wallet > In sync: true
digibyte-wallet > Height:  14263036
digibyte-wallet > Mempool: 17
```

Find more information [here](explorer.md).