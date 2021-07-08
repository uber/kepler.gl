import {Component} from 'react';
import KeplerGlContext from 'components/context';
import {ConnectedComponent} from 'react-redux';

interface ContextSelector {
  (state: any, context: any): KeplerGlContext;
}

export default function withLocalSelector<P, S>(
  component: ConnectedComponent<P, S>
): Component<P, S>;
