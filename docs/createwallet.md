# Create Wallet

To create a wallet you must use the `createwallet` command, next to the `-name` argument and the name of the wallet. By default it will generate segwit addresses in the livenet network.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -name     | Wallet name       | A string                     |
| -type     | Address type      | `legacy`, `segwit`, `native` |

## Flags

| Flag      | Description        |
| --------- | ------------------ |
| --testnet  | Enable testnet    |

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