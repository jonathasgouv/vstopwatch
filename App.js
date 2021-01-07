import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity, Image } from 'react-native';
import moment from 'moment';

function Timer({ interval }) {
	const pad = (n) => (n < 10 ? '0' + n : n);
	const duration = moment.duration(interval);
	const centiseconds = Math.floor(duration.milliseconds() / 10);
	return (
		<Text style={styles.text}>
			{pad(duration.minutes())}:{pad(duration.seconds())}:{pad(centiseconds)}
		</Text>
	);
}

function RoundButton({ title, color, background, onPress, disabled }) {
	return (
		<TouchableOpacity
			onPress={() => !disabled && onPress()}
			activeOpacity={disabled ? 1.0 : 0.5}
			style={styles.buttonBorder}
		>
			<View
				style={[
					styles.button,
					{ backgroundColor: background }
				]}
			>
				<Text
					style={[
						styles.buttonTitle,
						{ color }
					]}
				>
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

function ButtonRow({ children }) {
	return <View style={styles.buttonsRow}>{children}</View>;
}

function Lap({ number, interval, fastest, slowest }) {
	const pad = (n) => (n < 10 ? '0' + n : n);
	const duration = moment.duration(interval);
	const centiseconds = Math.floor(duration.milliseconds() / 10);

	const lapStyle = [
		styles.laptext,
		fastest && styles.fastest,
		slowest && styles.slowest
	];

	return (
		<View style={styles.lap}>
			<Text style={lapStyle}>Lap {number}</Text>
			<Text style={lapStyle}>
				{pad(duration.minutes())}:{pad(duration.seconds())}:{pad(centiseconds)}
			</Text>
		</View>
	);
}

function LapsTable({ laps, timer }) {
	const finishedLaps = laps.slice(1);
	let min = Number.MAX_SAFE_INTEGER;
	let max = Number.MIN_SAFE_INTEGER;

	if (finishedLaps.length >= 2) {
		finishedLaps.forEach((lap) => {
			if (lap < min) min = lap;
			if (lap > max) max = lap;
		});
	}

	return (
		<ScrollView style={styles.scrollView}>
			{laps.map((lap, index) => (
				<Lap
					number={laps.length - index}
					key={laps.length - index}
					interval={index === 0 ? timer + lap : lap}
					fastest={lap === min}
					slowest={lap === max}
				/>
			))}
		</ScrollView>
	);
}

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			start   : 0,
			now     : 0,
			laps    : [],
			stopped : false
		};
	}

	componentDidMount() {
		clearInterval(this.timer);
	}

	resume = () => {
		const now = new Date().getTime();
		this.setState({
			start   : now,
			now,
			stopped : false
		});
		this.timer = setInterval(() => {
			this.setState({
				now : new Date().getTime()
			});
		}, 100);
	};

	stop = () => {
		clearInterval(this.timer);
		this.stopped = true;
		const { laps, now, start } = this.state;
		const [
			firstLap,
			...other
		] = laps;
		this.setState({
			laps    : [
				firstLap + now - start,
				...other
			],
			now     : 0,
			start   : 0,
			stopped : true
		});
	};

	start = () => {
		const now = new Date().getTime();
		this.setState({
			start : now,
			now,
			laps  : [
				0
			]
		});
		this.timer = setInterval(() => {
			this.setState({
				now : new Date().getTime()
			});
		}, 100);
	};

	reset = () => {
		this.setState({
			start   : 0,
			now     : 0,
			laps    : [],
			stopped : false
		});
	};

	lap = () => {
		const timestamp = new Date().getTime();
		const { laps, now, start } = this.state;
		const [
			firstLap,
			...other
		] = laps;
		this.setState({
			laps  : [
				0,
				firstLap + now - start,
				...other
			],
			now   : timestamp,
			start : timestamp
		});
	};

	render() {
		const { start, now, laps, stopped } = this.state;
		const timer = now - start;
		let row;

		if (laps.length === 0 && stopped == false) {
			row = (
				<ButtonRow>
					<RoundButton title="Lap" color="#8b8b90" background="#151515" disabled />
					<RoundButton title="Start" color="#50D167" background="#1b361f" onPress={this.start} />
				</ButtonRow>
			);
		} else if (stopped == true) {
			row = (
				<ButtonRow>
					<RoundButton title="Reset" color="#FFFFFF" background="#3D3D3D" onPress={this.reset} />
					<RoundButton title="Resume" color="#50D167" background="#1b361f" onPress={this.resume} />
				</ButtonRow>
			);
		} else {
			row = (
				<ButtonRow>
					<RoundButton title="Lap " color="#FFFFFF" background="#3D3D3D" onPress={this.lap} />
					<RoundButton title="Stop" color="#e33935" background="#3c1715" onPress={this.stop} />
				</ButtonRow>
			);
		}

		return (
			<ImageBackground source={require('./assets/bg.jpg')} style={styles.image}>
				<View style={styles.container}>
					<Image source={require('./assets/logo.png')} style={styles.logo} />
					<Timer interval={laps.reduce((total, curr) => total + curr, 0) + timer} />
					{row}
					<LapsTable laps={laps} timer={timer} />
				</View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	container    : {
		flex              : 1,
		flexDirection     : 'column',
		backgroundColor   : '#111211',
		paddingHorizontal : 20
	},
	image        : {
		flex            : 1,
		resizeMode      : 'cover',
		justifyContent  : 'center',
		backgroundColor : '#111211',
		opacity         : 0.85
	},
	text         : {
		color      : 'white',
		fontSize   : 60,
		fontWeight : 'bold',
		textAlign  : 'center',
		paddingTop : 20,
		opacity    : 1
	},
	button       : {
		width          : 80,
		height         : 80,
		borderRadius   : 40,
		justifyContent : 'center',
		alignItems     : 'center',
		alignSelf      : 'center',
		opacity        : 0.8
	},
	buttonTitle  : {
		fontSize : 18
	},
	buttonBorder : {
		width          : 76,
		height         : 76,
		borderRadius   : 38,
		borderWidth    : 2,
		justifyContent : 'center',
		alignItems     : 'center',
		alignSelf      : 'center'
	},
	buttonsRow   : {
		flexDirection  : 'row',
		alignSelf      : 'stretch',
		justifyContent : 'space-between',
		marginTop      : 60
	},
	laptext      : {
		color      : '#ffffff',
		fontSize   : 18,
		fontWeight : '300'
	},
	lap          : {
		flexDirection   : 'row',
		justifyContent  : 'space-between',
		marginTop       : 10,
		borderWidth     : 3,
		borderColor     : '#4d4f4d',
		backgroundColor : '#4d4f4d',
		borderRadius    : 20,
		margin          : 3,
		padding         : 3,
		opacity         : 0.7
	},
	scrollView   : {
		marginTop : 30
	},
	fastest      : {
		color      : '#4bc05f',
		fontSize   : 18,
		fontWeight : '300'
	},
	slowest      : {
		color      : '#cc3531',
		fontSize   : 18,
		fontWeight : '300'
	},
	logo         : {
		width          : 50,
		height         : 50,
		justifyContent : 'center',
		alignSelf      : 'center',
		marginTop      : 100
	}
});
