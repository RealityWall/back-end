-- postgres -D /usr/local/var/postgres/ # start the db
-- psql realitywall # connect to the db
-- ps aux | grep postgres # shut down the db
DROP TABLE IF EXISTS walls, users, posts, comments, rates /*, notifications, badges, user_badges*/;

-- address format in database ?
CREATE TABLE walls (

	id SERIAL PRIMARY KEY,
	latitude float NOT NULL,
	longitude float NOT NULL,
	address text NOT NULL,
	address2 text DEFAULT NULL,
	postal_code text NOT NULL,
	city text NOT NULL
	/* V 10 country_code country_code NOT NULL -- enum, tableau ?*/

);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email varchar(255) NOT NULL UNIQUE,
	password text NOT NULL,
	firstname text NOT NULL,
	lastname text NOT NULL,
	-- date_of_birth timestamp NOT NULL, -- date format ? in a next version
	created_at timestamp NOT NULL,
	updated_at timestamp NOT NULL,
	session_id text DEFAULT NULL
);

CREATE TABLE posts (

	id SERIAL PRIMARY KEY,
	title varchar(255) DEFAULT NULL,
	content text NOT NULL, -- (html with link and <br/>)
	created_at timestamp NOT NULL,
	user_id integer NOT NULL,
	wall_id integer NOT NULL, -- (can be NULL if it is a comment)

	foreign key (user_id) references users (id),
	foreign key (wall_id) references walls (id)

);

CREATE TABLE comments (

	id SERIAL PRIMARY KEY,
	content text NOT NULL, -- (html with link and <br/>)
	created_at timestamp NOT NULL,
	user_id integer NOT NULL,
	post_id integer NOT NULL,

	foreign key (user_id) references users (id),
	foreign key (post_id) references posts (id)

);

CREATE TABLE posts_rates (

	post_id integer NOT NULL,
	user_id integer NOT NULL,
	type boolean NOT NULL, -- true = + || false = -

	primary key (post_id, user_id),
	foreign key (post_id) references posts (id),
	foreign key (user_id) references users (id)

);

CREATE TABLE comments_rates (

	comment_id integer NOT NULL,
	user_id integer NOT NULL,
	type boolean NOT NULL, -- true = + || false = -

	primary key (comment_id, user_id),
	foreign key (comment_id) references comments (id),
	foreign key (user_id) references users (id)

);

-- V 2.0
/*
CREATE TABLE notifications (

	id SERIAL PRIMARY KEY,
	type integer NOT NULL, -- badge, palier
	created_at timestamp NOT NULL,
	post_id integer DEFAULT NULL,

	foreign key (post_id) references posts (id)

);

CREATE TABLE badges (

	id SERIAL PRIMARY KEY,
	title varchar(255) NOT NULL,
	description text NOT NULL

);

CREATE TABLE user_badges (

	user_id integer NOT NULL,
	badge_id integer NOT NULL,

	primary key (badge_id, user_id),
	foreign key (badge_id) references badges (id),
	foreign key (user_id) references users (id)

);

CREATE TABLE following (
	user_id integer NOT NULL,
	wall_id integer NOT NULL,

	primary key (wall_id, user_id),
	foreign key (wall_id) references walls (id),
	foreign key (user_id) references users (id)
);

SELECT
       p.id, p.title, p.content, p.created_at, p.user_id, p.wall_id,
       coalesce(comments_count, 0) comments_count,
       coalesce(rates_count, 0) rates_count,
       SUM(comments_count + rates_count) as score
FROM posts p
LEFT JOIN
    (SELECT c.post_id, count(1) comments_count
     FROM comments c
    GROUP BY c.post_id) as c
ON c.post_id=p.id
LEFT JOIN
	(SELECT r.post_id, count(1) rates_count
	 FROM posts_rates r
	GROUP BY r.post_id) as r
ON r.post_id=p.id
GROUP BY p.id, comments_count, rates_count
ORDER BY (score) DESC;



SELECT
	c.id, c.content, c.created_at, c.user_id, c.post_id,
	coalesce(likes_count, 0) likes_count,
	coalesce(dislikes_count, 0) dislikes_count,
	SUM(coalesce(likes_count + dislikes_count, 0)) as score
FROM comments c
LEFT JOIN
	(SELECT r.comment_id, COUNT(1) likes_count
		FROM comments_rates r
		WHERE r.type=true
		GROUP BY r.comment_id) as r1
	ON  r1.comment_id=c.id
LEFT JOIN
	(SELECT r.comment_id, COUNT(1) dislikes_count
		FROM comments_rates r
		WHERE r.type=false
		GROUP BY r.comment_id) as r2
	ON  r2.comment_id=c.id
WHERE c.post_id=2
GROUP BY c.id, likes_count, dislikes_count
ORDER BY score DESC;

*/











