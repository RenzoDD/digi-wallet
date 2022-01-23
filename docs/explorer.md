# Open Wallet

To check any address/transaction in the blockchain you must use the `explorer` command. If you don't provide and address or txid it will retrive the blockchain status.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |
| -address  | DigiByte address  | A string                     |
| -txid     | Transaction ID    | A string                     |

## Flags

| Flag      | Description        |
| --------- | ------------------ |
| --testnet | Enable testnet     |

## Examples

```
digi-wallet > explorer
digi-wallet > Server:  digibyteblockexplorer.com
digi-wallet > In sync: true
digi-wallet > Height:  14263036
digi-wallet > Mempool: 17
```

```
digi-wallet > explorer -address DFDqV6Tbh5ErgSEUhXJWed2LGfGwfJ5bme
digi-wallet > Total Received: 0.60356285
digi-wallet > Total Sent:     0
digi-wallet > Total Balance:  0.60356285
digi-wallet > Tx Apperances:  35
```

```
digi-wallet > explorer -txid cb2d9368b1d2009cf2c851caedc56df3cee0206932ec3c22d65d5af391d8a161
digi-wallet > DateTime: Sat Dec 25 2021 17:06:38 GMT-0500 (hora estándar de Perú)
digi-wallet > Confirmations: 19232
digi-wallet > Input: 2306.12056345
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 284.12056345 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 11.00154519 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 202 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 719.97948454 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 20.01897027 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 9 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 5 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 5 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 50 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 950 DGB
digi-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 50 DGB
digi-wallet > Output: 2306.12054166
digi-wallet >   DMTga27bmCyYoffcF5maQsGi8WAxsxMRmH 768.70684722 DGB
digi-wallet >   dgb1qtlrxqr5044q46t5pdxcku000kqk7jtvp0lh62p 768.70684722 DGB (spend)
digi-wallet >   Sdwn391WLVeSXTwFD8eSyiUAUGYV83CrCt 768.70684722 DGB
digi-wallet >   OP_RETURN (DigiFaucet Giveaway Christmas 2021 Prize) 0 DGB
digi-wallet > Fees: 0.00002179
digi-wallet > Size: 1783 Bytes
```