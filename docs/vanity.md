# Vanity Addresses

Is an address that contains an specific substring. To look for an address you must use the `vanity` command.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -pattert  | Target search     | A string                     |
| -type     | Address type      | `legacy`, `segwit`, `native` |

## Flags

| Flag        | Description    |
| ----------- | -------------- |
| --testnet   | Enable testnet |

## Examples

```
digibyte-wallet > vanity -pattern DDiaz
digibyte-wallet > 103219 addresses checked
digibyte-wallet > 1021 / sec
digibyte-wallet > WIF: L2HzbXijGWWX2o8Nug5N5oAzDnnuRJzWyc8XzoiNLAhRRKUZVVpj
digibyte-wallet > Address: DDiazCg7s9dFAbSkPHGVAbqj5h9GpzZTYk
```