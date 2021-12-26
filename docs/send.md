# Send Coins

To send funds to another wallet you must use the `send` command.

## Arguments

| Argument  | Description       | Values                       |
| --------- | ----------------- | ---------------------------- |

## Flags

| Flag      | Description                       |
| --------- | --------------------------------- |
| --payload | Add extra data to the transaction |

## Examples

Send part of the wallet funds.
```
my-wallet > send
my-wallet > Available balance: 8570.01255 DGB
my-wallet > Pay to: DN1n37nMviDx4WNYczM4XoT2WXyzbCcvjL
my-wallet > Amount: 430
my-wallet > Password: ****
my-wallet > TXID: dbfc1a9a5da03dc09b6d5abb3ed59022946d30f3e37b10ac0f467ac1488fefea
```

Send all the funds of the wallet.
```
my-wallet > send
my-wallet > Available balance: 8570.01255 DGB
my-wallet > Pay to: DN1n37nMviDx4WNYczM4XoT2WXyzbCcvjL
my-wallet > Amount: all
my-wallet > Password: ****
my-wallet > TXID: 149a5adab9028ff3649f903edde1b9bf2fe7112eed6a4d924573d5f7083fa325
```

Add aditional data to the transaction (OP_RETURN)
```
my-wallet > send --payload
my-wallet > Available balance: 8570.01255 DGB
my-wallet > Pay to: DN1n37nMviDx4WNYczM4XoT2WXyzbCcvjL
my-wallet > Amount: all
my-wallet > Extra data: Hola Mundo
my-wallet > Password: ****
my-wallet > TXID: 149a5adab9028ff3649f903edde1b9bf2fe7112eed6a4d924573d5f7083fa325
```