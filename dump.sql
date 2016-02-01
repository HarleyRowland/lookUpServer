/*Backend bootstrap SQL*/
DROP TABLE IF EXISTS userAuthentication, userLocation, userSettings, user, transactionHistory;

/*Create table statements*/
CREATE TABLE user(
    userID VARCHAR(15),
    PRIMARY KEY(userID)
);

CREATE TABLE userSettings(
    userID      VARCHAR(15),
    play        BOOL,
    FOREIGN KEY(userID)
        REFERENCES user(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE userLocation(
    userID      VARCHAR(15),
    longitude   DOUBLE(11, 8),
    latitude    DOUBLE(10, 8),
    timestamp   TIMESTAMP,
    FOREIGN KEY(userID)
        REFERENCES user(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE userAuthentication(
    userID              VARCHAR(15),
    password            VARCHAR(30),
    authenticationCode  CHAR(5),
    userAuthenticated   BOOL,
        FOREIGN KEY(userID)
        REFERENCES user(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE transactionHistory(
    userID      VARCHAR(15),
    messageSent VARCHAR(30),
    timestamp   TIMESTAMP
);

/*Insert population statements*/
INSERT INTO user VALUES('+447813646238');
INSERT INTO user VALUES('+447535620820');
INSERT INTO user VALUES('+447528441371');
INSERT INTO user VALUES('+447427632795');
INSERT INTO user VALUES('+447964129140');

INSERT INTO userSettings VALUES('447813646238', 0);
INSERT INTO userSettings VALUES('447535620820', 1);
INSERT INTO userSettings VALUES('447528441371', 1);
INSERT INTO userSettings VALUES('447427632795', 0);
INSERT INTO userSettings VALUES('447964129140', 1);

INSERT INTO userLocation VALUES('447813646238', 000.00000000, 00.00000000, NOW());
INSERT INTO userLocation VALUES('447535620820', 000.00000000, 00.00000000, NOW());
INSERT INTO userLocation VALUES('447528441371', 000.00000000, 00.00000000, NOW());
INSERT INTO userLocation VALUES('447427632795', 000.00000000, 00.00000000, NOW());
INSERT INTO userLocation VALUES('447964129140', 000.00000000, 00.00000000, NOW());

INSERT INTO userAuthentication VALUES('447813646238', 'password101', 'ce124', 1);
INSERT INTO userAuthentication VALUES('447535620820', 'computer2000', 'cg546', 1);
INSERT INTO userAuthentication VALUES('447528441371', 'keyboard3', 'ju878', 1);
INSERT INTO userAuthentication VALUES('447427632795', 'more_complicated!@09', 'g8h92', 1);
INSERT INTO userAuthentication VALUES('447964129140', 'MyDogsNameIs fluffy', '09802', 0);