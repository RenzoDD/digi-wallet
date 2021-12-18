# Open Wallet

To open an existing wallet you must use the `openwallet` command, next to the `-path` and `-password` arguments.

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
digibyte-wallet > openwallet -path D:\Docs\wallet\my_wallet.dgb -password dgb-rocks
```

```
digibyte-wallet > openwallet -path D:\Docs\wallet\my_wallet.dgb
digibyte-wallet > Password: *********
```

```
digibyte-wallet > openwallet
digibyte-wallet > Enter file path: D:\Docs\Path with spaces\my_wallet.dgb
digibyte-wallet > Password: *********
```