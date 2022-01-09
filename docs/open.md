# Open Wallet

To open an existing wallet you must use the `open` command, next to the `-path` and `-password` arguments. Instead of the `path` argument you can provide the `name` argument if the wallet is in the same directory as the application.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -path     | Wallet path       | A string                     |
| -name     | Wallet name       | A string                     |
| -password | Wallet password   | A string                     |

## Flags

| Flag      | Description        |
| --------- | ------------------ |

## Examples

```
digi-wallet > open -path D:\docs\wallet\my_wallet.dgb -password dgb-rocks
```

```
digi-wallet > open -path D:\Docs\wallet\my_wallet.dgb
digi-wallet > Password: *********
```

```
digi-wallet > open
digi-wallet > Wallet path/name: D:\docs\Path with spaces\my_wallet.dgb
digi-wallet > Password: *********
```