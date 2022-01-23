# Close Wallet

To redeem a papaer wallet or private key you must use the `sweep` command, it will scann the blockchain looking for available coins. You must have a wallet open to store the new coins and it will assume the network according to your wallet. 

## Arguments

| Argument  | Description          | Values                       |
| --------- | -------------------- | ---------------------------- |
| -wif      | Wallet Import Format | A string                     |
| -data     | OP Return data       | A string                     |

## Flags

| Flag      | Description                         |
| --------- | ----------------------------------- |
| --payload | Enable OP Return data               |
| --hard    | Include (and burn) DigiAsset output |

## Examples

```
my-wallet > sweep -wif KwqYdEUMQTWzMYdqysDinmRXfc4cydvqtxj2udPTVPrgfe4eRM3D
my-wallet > Scanning the blockchain...
my-wallet >   dgb1qrczfdzxsw58uq3m0hu058jjukxcffhkmednwqf: 38.01920771 DGB
my-wallet > Total: 38.01920771 DGB
my-wallet > Reedem wallet? (y/n): y
my-wallet > TXID: 63ca13b45d5e9e31d2c7bf837fff0133dfb1c49d0d021feed8da30f9f176eb9a
```

```
my-wallet > sweep --payload
my-wallet > WIF: L5HzTPGjQRcNPdbMghq8P1q2L2jK9cXr2Xbu4jmkY1FEq875iVxV
my-wallet > Extra data: My Data
my-wallet > Scanning the blockchain...
my-wallet >   dgb1q2cx6756vd97wj5n2049xhjlq8t5dcckd5pkh8v: 38.01920321 DGB
my-wallet > Total: 38.01920321 DGB
my-wallet > Reedem wallet? (y/n): y
my-wallet > TXID: 50b19717347a26c8e70332c03c439a421866b196013e580580d3ae383d770d19
```