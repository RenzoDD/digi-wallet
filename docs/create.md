# Create Wallet

To create a wallet you must use the `create` command, with the `-name`, `-password`, `-entropy` arguments. By default it will generate a segwit wallet in the livenet network.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -name     | Wallet name       | A string                     |
| -password | Wallet password   | A string                     |
| -entropy  | Initial entropy   | A string                     |
| -type     | Address type      | `legacy`, `segwit`, `native` |

## Flags

| Flag        | Description            |
| ----------- | ---------------------- |
| --testnet   | Enable testnet         |
| --nobackup  | Hide mnemonic          |
| --noentropy | Disable manual entropy |

## Examples

A segwit wallet (dgb1...)
```
digibyte-wallet > createwallet -name my_wallet
```

A legacy wallet (D...)
```
digibyte-wallet > createwallet -name my_wallet -type legacy
```

A segwit testnet wallet (dgbt1...)
```
digibyte-wallet > createwallet -name my_wallet --testnet
```