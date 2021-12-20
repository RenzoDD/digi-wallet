# Commands

The following commands can be used to interact with the wallet.

## Create Wallet

Create a file that contains all the information of a crypto wallet.

```
digibyte-wallet > createwallet -name my_wallet
```

Find more information [here](createwallet.md).

## Open Wallet

Open an existing wallet

```
digibyte-wallet > openwallet
```

Find more information [here](openwallet.md).

## Close Wallet

Close a wallet

```
my-wallet > closewallet
```

Find more information [here](closewallet.md).

## Generate Address

Generate a new address from the master public key

```
my-wallet > generateaddress
```

Find more information [here](generateaddress.md).

## Sync

Retrive UTXOs information from a public DigiByte full node

```
my-wallet > sync
my-wallet > Balance: 1025.556
```

## Xpub

Get the main HD public key. Derived up to level 3

```
my-wallet > xpub
my-wallet > vpub5ZZX2YYoFAU6JBCLR8P4tZMMbsA9ZWTfSeFsZ2iF9ZPw6xKuGUPG2ewk5Q8xQP9DwB9DPDoeD5kBYdmymuZmgQhqTrsLr9NBQZm2cmcw3bz
```