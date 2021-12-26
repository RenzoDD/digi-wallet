# Open Wallet

To open an existing wallet you must use the `open` command, next to the `-path` and `-password` arguments.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -path     | Wallet path       | A string                     |
| -password | Wallet password   | A string                     |

## Flags

| Flag      | Description        |
| --------- | ------------------ |

## Examples

```
digibyte-wallet > open -path D:\docs\wallet\my_wallet.dgb -password dgb-rocks
```

```
digibyte-wallet > open -path D:\Docs\wallet\my_wallet.dgb
digibyte-wallet > Password: *********
```

```
digibyte-wallet > open
digibyte-wallet > Enter file path: D:\docs\Path with spaces\my_wallet.dgb
digibyte-wallet > Password: *********
```