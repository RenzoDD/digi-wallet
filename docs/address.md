# Generate Address

To generate a new address use the `address` command. There are three scenarios where the user can execute this command:
- To generate the next address from the HD public key.
- To generate the address from a custom WIF
- To generate a random address

HD generation is the only method where an open wallet is required. The output WIF's are never stored.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -password | Wallet password   | A string                     |
| -WIF      | Source WIF        | A string                     |
| -type     | Address type      | `legacy`, `segwit`, `native` |

## Flags

| Flag      | Description               |
| --------- | ------------------------- |
| --reveal  | Shows WIF                 |
| --random  | Generate a random address |

## Examples

Generate the next address from the HD public key
```
my-wallet > address
my-wallet > Address: DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG
```

```
my-wallet > address -password 1234 --reveal
my-wallet > Address: DLqf6GwwigdWFTjHtdK5kMjPcz7AMvgzMb
my-wallet > WIF: Kzk2T1cCwha1FEHWE611UK1LjRE9Y1wqssum31FzCEAuBEfX8E59
```

Generate the address from a custom WIF
```
digi-wallet > address -WIF L1Zi5auVHeeAheAN9E6ofhj36qF68175of75JjdVY8wdshLoywoE
digi-wallet > Address: DBgp1RAMB7bth5EHKv1AqkT7yMfXKuA1gU
```

Generate a random address
```
digi-wallet > address --random
digi-wallet > Address: DNVGoDfcEYYLRPaHj6vGHEZ4PfHMVgpFb7
digi-wallet > WIF: KxdNHU1eq1WVXN1Gyw45wKM8AescD9ZYNirA8yu57U2UBQiZ7d6h
```
```
digi-wallet > address -type segwit --random
digi-wallet > Address: dgb1qtq60jyhu80dhvn9p5uu7357rs6jsdc3arpc5k9
digi-wallet > WIF: L2NDibFpGchAQWGU3kTHWeNa7yn7ZgX9c7ABa8EaFFtcP4KA5NoM
```