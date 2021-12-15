CREATE TABLE Addresses (
	AddressID	INTEGER,

	Change		INTEGER	NOT NULL,
	`Index`		INTEGER	NOT NULL,
	WIF         TEXT	NOT NULL,
	Address		TEXT	NOT NULL	UNIQUE,

	PRIMARY KEY (AddressID AUTOINCREMENT)
);

CREATE TABLE UTXOs (
	UtxoID			INTEGER,

	AddressID		INTEGER		NOT NULL,
    
	TXID			TEXT		NOT NULL,
	Script			TEXT		NOT NULL,
	N				INTEGER		NOT NULL,
	Satoshis		INTEGER		NOT NULL,
    Height          INTEGER     NOT NULL,

	PRIMARY KEY (UtxoID AUTOINCREMENT),
	FOREIGN KEY (AddressID) REFERENCES Addresses (AddressID),
	UNIQUE(TXID, N)
);

CREATE TABLE Data (
	Key		TEXT	NOT NULL	UNIQUE,
	Value	TEXT	NOT NULL
);