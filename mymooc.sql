USE mymooc;

CREATE TABLE tbl_user (
	id VARCHAR(100) NOT NULL PRIMARY KEY,
	number INT(100) NOT NULL,
	password VARCHAR(300) NOT NULL,
	grade VARCHAR(100) NOT NULL,
	class VARCHAR(100) NOT NULL,
	email VARCHAR(100) DEFAULT NULL,
	auth INT NOT NULL,
	profile VARCHAR(200) DEFAULT NULL,
	profile_image VARCHAR(300) DEFAULT NULL,
	status BOOL DEFAULT FALSE NOT NULL
);
CREATE TABLE tbl_board(
	id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	writer VARCHAR(100) NOT NULL,
	category VARCHAR(100) NOT NULL,
	file VARCHAR(200) DEFAULT NULL,
	content VARCHAR(1000) DEFAULT NULL,
	regdate DATETIME DEFAULT NOW() NOT NULL,
	editdate DATETIME DEFAULT NOW() NOT NULL
);
CREATE TABLE tbl_attend(
	id VARCHAR(100) NOT NULL PRIMARY KEY
);

SELECT * FROM tbl_user;