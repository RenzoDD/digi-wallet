# Restore Wallet

To restore a wallet from a mnemonic phrase you must use the `restore` command, with the `-name` and `-password` arguments. By default it will generate a segwit wallet in the livenet network unless you provide the custom flags.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -name     | Wallet name       | A string                     |
| -password | Wallet password   | A string                     |
| -type     | Address type      | `legacy`, `segwit`, `native` |

## Flags

| Flag        | Description            |
| ----------- | ---------------------- |
| --testnet   | Enable testnet         |

## Examples

A segwit wallet (dgb1...)
```
digi-wallet > restore -name my_wallet
```

A legacy wallet (D...)
```
digi-wallet > restore -name my_wallet -type legacy
```

A segwit testnet wallet (dgbt1...)
```
digi-wallet > restore -name my_wallet --testnet
```