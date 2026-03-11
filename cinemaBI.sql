CREATE TABLE Utilisateur (
    IDUtilisateur INT PRIMARY KEY AUTO_INCREMENT,
    motDePasse VARCHAR(255) NOT NULL,
    Pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Avis (
    IDAvis INT PRIMARY KEY AUTO_INCREMENT,
    Note ENUM('0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5') NOT NULL,
    Commentaire VARCHAR(1000),
    DateAvis DATE NOT NULL,
    IDUtilisateur INT NOT NULL,
    IDFilm INT NOT NULL,
    FOREIGN KEY (IDUtilisateur) REFERENCES Utilisateur(IDUtilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Favoris (
    IDUtilisateur INT NOT NULL,
    IDFilm INT NOT NULL,
    PRIMARY KEY (IDUtilisateur, IDFilm),
    FOREIGN KEY (IDUtilisateur) REFERENCES Utilisateur(IDUtilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Watchlist (
    IDUtilisateur INT NOT NULL,
    IDFilm INT NOT NULL,
    PRIMARY KEY (IDUtilisateur, IDFilm),
    FOREIGN KEY (IDUtilisateur) REFERENCES Utilisateur(IDUtilisateur)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);