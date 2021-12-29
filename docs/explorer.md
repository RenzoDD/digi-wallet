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
digibyte-wallet > explorer
digibyte-wallet > Server:  digibyteblockexplorer.com
digibyte-wallet > In sync: true
digibyte-wallet > Height:  14263036
digibyte-wallet > Mempool: 17
```

```
digibyte-wallet > explorer -address DFDqV6Tbh5ErgSEUhXJWed2LGfGwfJ5bme
digibyte-wallet > Total Received: 0.60356285
digibyte-wallet > Total Sent:     0
digibyte-wallet > Total Balance:  0.60356285
digibyte-wallet > Tx Apperances:  35
```

```
digibyte-wallet > explorer -txid cb2d9368b1d2009cf2c851caedc56df3cee0206932ec3c22d65d5af391d8a161
digibyte-wallet > DateTime: Sat Dec 25 2021 17:06:38 GMT-0500 (hora estándar de Perú)
digibyte-wallet > Confirmations: 19232
digibyte-wallet > Input: 2306.12056345
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 284.12056345 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 11.00154519 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 202 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 719.97948454 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 20.01897027 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 9 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 5 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 5 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 50 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 950 DGB
digibyte-wallet >   DPVSbSogQhcP2fvnmYvTj8rCLg2Y9NJpR2 50 DGB
digibyte-wallet > Output: 2306.12054166
digibyte-wallet >   DMTga27bmCyYoffcF5maQsGi8WAxsxMRmH 768.70684722 DGB
digibyte-wallet >   dgb1qtlrxqr5044q46t5pdxcku000kqk7jtvp0lh62p 768.70684722 DGB (spend)
digibyte-wallet >   Sdwn391WLVeSXTwFD8eSyiUAUGYV83CrCt 768.70684722 DGB
digibyte-wallet >   OP_RETURN (DigiFaucet Giveaway Christmas 2021 Prize) 0 DGB
digibyte-wallet > Fees: 0.00002179
digibyte-wallet > Size: 1783 Bytes
```