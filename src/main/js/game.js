/*global SNAKE, window */
/*jslint browser: true */
/*jslint bitwise: false */

/**
 * Anova IT Consulting 2011
 *
 * This file is licensed under the GPL version 3.
 * Please refer to the URL http://www.gnu.org/licenses/gpl-3.0.html for details.
 */
SNAKE.record = function () {
	'use strict';
	var record_html5, support_storage, record_dummy;

	support_storage = function () {
		try {
			return typeof window.localStorage !== 'undefined';
		} catch (err) {
			return false;
		}
	};

	record_html5 = {
		init: function () {
			if (window.localStorage['snake.record'] === null || isNaN(window.localStorage['snake.record'])) {
				window.localStorage['snake.record'] = 0;
			}
		},
		set_record: function (record) {
			window.localStorage['snake.record'] = record;
		},
		get_record: function () {
			var record = window.localStorage['snake.record'];
			return record === null ? 0 : parseInt(record, 10);
		},
		clear: function () {
			window.localStorage.removeItem('snake.record');
		}
	};

	record_dummy = {
		init: function () {},
		set_record: function (record) {},
		get_record: function () {
			return 0;
		}	
	};
	
	return support_storage() ? record_html5 : record_dummy;
};

SNAKE.media = function() {
	'use strict';
	var snd_bg, snd_eat, snd_game_over;
	
	// Mappy (main theme) http://www.digitpress.com/dpsoundz/mp3/mappy_main.mp3
	snd_bg = document.getElementById('snd_bg');
	snd_eat = document.getElementById('snd_eat');
	snd_game_over = document.getElementById('snd_game_over');
	
	return {
		init: function () {
			snd_bg.setAttribute('src', 'media/mappy_main.ogg');
			snd_eat.setAttribute('src', 'media/apple.ogg');
			snd_game_over.setAttribute('src', 'media/game_over.ogg');
			return this;
		},
		play_background: function () {
			snd_bg.loop = true;
			snd_bg.play();
		},
		stop_background: function() {
			snd_bg.stop();
		},
		play_eat: function () {
			snd_bg.volume = 0.3;
			snd_eat.play();
			setTimeout(function () {
				snd_bg.volume = 0.9;
			}, 500);
		},
		stop_eat: function () {
			snd_eat.stop();
		},
		play_game_over: function () {
			snd_bg.pause();
			snd_eat.pause();
			snd_game_over.play();
		},
		stop: function() {
			snd_bg.pause();
			snd_eat.pause();
			snd_game_over.pause();
		}
	};
};

SNAKE.game = function () {
	'use strict';
	var canvas, engine, main, cb_draw_snake, cb_draw_food, cb_game_over, 
		cb_next_tick, reset, moves, cb_eat_food, record, score, update_score, EATING_SCORE;
	
	EATING_SCORE = 10; // default eating score
	
	canvas = document.getElementById('canvas').getContext('2d');
	engine = null;
	
	record = SNAKE.record();
	score = document.getElementById('score');
	
	update_score =  function(attr_color) {
		score.innerHTML = 'Your score: ' + record.get_record();
		score.style.color = attr_color ? attr_color : 'black';
	};
	
	main = function () {
		canvas.fillStyle = 'black';
		engine.tick();
	};
	
	cb_draw_snake = function (snake) {
		snake.map(function (p) {
			//canvas.fillRect(p.x << 3, p.y << 3, 8, 8);
			var s = new Image();
			s.src='images/snake.gif';
			canvas.drawImage(s, (p.x << 3), (p.y << 3), 7, 7);
		});
	};

	cb_draw_food = function (food) {
		//canvas.beginPath();
		//canvas.arc((food.x << 3) + 4, (food.y << 3) + 4, 4, 0, 7);
		//canvas.fill();
		var f = new Image();
		f.src='images/food.gif';
		canvas.drawImage(f, (food.x << 3), (food.y << 3), 7, 7);
	};

	cb_eat_food = function(food) {
		record.set_record(record.get_record() + EATING_SCORE);
		update_score();
		
		SNAKE.media().play_eat();
	};

	cb_game_over = function (snake) {
		update_score('red');
		
		canvas.fillStyle = 'red';
		canvas.fillRect(0, 0, 128, 128);
				
		cb_draw_snake(snake);
		setTimeout(function () {
			record.set_record(0);
			update_score();
			SNAKE.media().init().play_background();
			
			canvas.clearRect(0, 0, 128, 128);
			engine.reset();			
			main();
			
		}, 500);
	};
	
	cb_next_tick = function (snake) {
		canvas.clearRect(0, 0, 128, 128);
		setTimeout(main, 350 - snake.length * 5);
	};
	
	reset = function () {
		engine = SNAKE.engine().init({
			draw_snake: cb_draw_snake,
			draw_food: cb_draw_food,
			game_over: cb_game_over,
			next_tick: cb_next_tick,
			eat_food: cb_eat_food
		});
	};

	moves = {
		37: {x: -1, y:  0},
		38: {x:  0, y: -1},
		39: {x:  1, y:  0},
		40: {x:  0, y:  1}
	};

	return {
		init: function () {
			record.init();
			update_score();
			
			SNAKE.media().init().play_background();
			
			reset();
			window.addEventListener('keydown', function (e) {
				var m = moves[e.keyCode];
				if (m) {
					engine.move(m);
				}
			}, false);
			return this;
		},
		start: function () {
			setTimeout(main, 0);
		}
	};
	
};
