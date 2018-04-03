var songs = [
	'Girlfriend.mp3',
	'Perfect.mp3',
	'Mr.Brightside.mp3'
]

document.getElementById( "queue" ).innerHTML = '<span id="queue">' + songs.length + '</span>';

var audio = new Audio();
audio.type = 'audio/mpeg';
audio.volume = 0.3;
audio.crossOrigin = "anonymous";

var current_song = shuffle_song();

if ( audio.canPlayType( 'audio/mpeg;' ) ) {
	play_song( current_song );
};

audio.addEventListener( 'ended', function() {
	forward_song();
}, false );

audio.addEventListener( "timeupdate", function() {
	var duration = parseInt( audio.duration ),
		current_time = parseInt( audio.currentTime );

	var time_remaining = duration - current_time;

	var seconds = time_remaining % 60,
		minutes = Math.floor( time_remaining / 60 ) % 60;

	seconds = seconds < 10 ? "0" + seconds : seconds;
	minutes = minutes < 10 ? "0" + minutes : minutes;

	document.getElementById( "duration" ).innerHTML = '<span id="duration">' + minutes + ":" + seconds + '</span>';
}, false );

function shuffle_song() {
	return songs[ Math.floor( Math.random() * songs.length ) ];
}

function play_song( song ) {
	var audio_source = "assets/audio/" + song;

	if ( audio.src == audio_source ) {
		return;
	}

	audio.src = audio_source;
	audio.play();

	document.getElementById( "name" ).innerHTML = '<span id="name">' + song.slice( 0, -4 ) + '</span>';
};

function backward_song() {
	var index = songs.indexOf( current_song );

	if ( index > 0 ) {
		current_song = songs[ index - 1 ];
	} else {
		current_song = songs[ songs.length - 1 ];
	}

	play_song( current_song );
};

function forward_song() {
	var index = songs.indexOf( current_song );

	if ( index >= 0 && index < songs.length - 1 ) {
		current_song = songs[ index + 1 ];
	} else {
		current_song = songs[ 0 ];
	}

	play_song( current_song );
};

function resume_song() {
	audio.play();

	var element = document.getElementById( "pause" );
	element.setAttribute( "value", "⏸" );
	element.setAttribute( "onclick", "pause_song()" );
};

function pause_song() {
	audio.pause();

	var element = document.getElementById( "pause" );
	element.setAttribute( "value", "▶" );
	element.setAttribute( "onclick", "resume_song()" );
};

function mute_song() {
	audio.muted = true;

	var element = document.getElementById( "mute" );
	element.setAttribute( "value", "🔈" );
	element.setAttribute( "onclick", "unmute_song()" );
}

function unmute_song() {
	audio.muted = false;

	var element = document.getElementById( "mute" );
	element.setAttribute( "value", "🔉" );
	element.setAttribute( "onclick", "mute_song()" );
}

window.AudioContext = window.AudioContext;

window.onload = function() {
	var context = new AudioContext();

	var analyser = context.createAnalyser();
	analyser.connect( context.destination );

	var audio_source = context.createMediaElementSource( audio );
	audio_source.connect( analyser );

	var frequency = new Uint8Array( analyser.frequencyBinCount );

	var canvas = document.getElementById( 'canvas' ),
		width = canvas.width,
		height = canvas.height - 2;

	var max_meters = 800 / ( 10 + 2 ),
		positions = [];

	context = canvas.getContext( '2d' );

	var gradient = context.createLinearGradient( 0, 0, 0, 300 );
	gradient.addColorStop( 1, '#0f0' );
	gradient.addColorStop( 0.5, '#ff0' );
	gradient.addColorStop( 0, '#f00' );

    // help from google
	function render_frame() {
		var array = new Uint8Array( analyser.frequencyBinCount );
        analyser.getByteFrequencyData( array );
        
		var step = Math.round( array.length / max_meters );
		context.clearRect( 0, 0, width, height );

		for ( var i = 0; i < max_meters; i++ ) {
			var value = array[ i * step ];

			if ( positions.length < Math.round( max_meters ) ) {
				positions.push( value );
			};

			context.fillStyle = "#FFF";

			if ( value < positions[ i ] ) {
				context.fillRect( i * 12, height - ( --positions[ i ] ), 10, 2 );
			} else {
				context.fillRect( i * 12, height - value, 10, 2 );
				positions[ i ] = value;
			}

            context.fillStyle = gradient;
            
			context.fillRect( i * 12, height - value + 2, 10, height );
		}

		requestAnimationFrame( render_frame );
	}

	render_frame();
};