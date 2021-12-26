# User Manual

This manual is intended for the wallet's end users. It will explain how to interact with its console interface, the available commands will be mentioned and examples will be provided.

## Commands

When it is running, you will have a simple command line in which you can enter precise instructions along with arguments that the wallet will execute.

```
digibyte-wallet > [type-here]
```

The available commands are listed in the [commands](commands.md) file.

## Arguments

After typing the command, in some cases you will need to provide additional information in the form of arguments. To enter an argument, you will first need to place its indicator, which is denoted by a dash and one or more letters `-argument`. Immediately after, the value that will contain `value`. The entered value may not contain spaces and should not be enclosed in quotation marks or similar characters.

```
digibyte-wallet > command -argument value
```

The arguments that each command needs will be listed in the individual command file.

## Flags

Flags can also be included. These are boolean values. If they are present then the value will be assumed to be true and if they are not it will be false. A flag is denoted by two hyphens and one or more letters `--flag`.

```
digibyte-wallet > command --flag
```

The flags that each command needs will be listed in the individual command file.
