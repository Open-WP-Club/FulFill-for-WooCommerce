'use strict';
const React = require('react');
const {View, Text, Image, ScrollView} = require('react-native');

const NOOP = () => {};
const ID = (x) => x;

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: ID,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,

  // Shared values
  useSharedValue: (init) => ({value: init}),
  useDerivedValue: (fn) => ({value: fn()}),

  // Animated styles / props
  useAnimatedStyle: () => ({}),
  useAnimatedProps: () => ({}),
  useAnimatedScrollHandler: () => NOOP,
  useAnimatedRef: () => ({current: null}),
  useAnimatedGestureHandler: () => NOOP,

  // Animations
  withTiming: ID,
  withSpring: ID,
  withDelay: (_delay, animation) => animation,
  withSequence: (...anims) => anims[anims.length - 1],
  withRepeat: ID,
  withDecay: ID,
  cancelAnimation: NOOP,

  // Helpers
  interpolate: (_value, _in, out) => out[0],
  interpolateColor: (_value, _in, out) => out[0],
  Extrapolation: {EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity'},
  ReduceMotion: {System: 'system', Always: 'always', Never: 'never'},

  // Thread bridges
  runOnUI: (fn) => fn,
  runOnJS: (fn) => fn,

  // Misc
  Easing: {
    linear: ID,
    ease: ID,
    quad: ID,
    cubic: ID,
    bezier: () => ID,
    in: ID,
    out: ID,
    inOut: ID,
  },
  FadeIn: {},
  FadeOut: {},
  Layout: {},
};
