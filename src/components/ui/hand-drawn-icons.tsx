// filepath: components/ui/hand-drawn-icons.tsx
'use client';
import React, { ForwardedRef } from 'react';
import {
  House,
  UserCircle,
  Briefcase,
  BookOpen,
  EnvelopeSimple,
  ChatCircleText,
  MapTrifold,
  X,
  ArrowRight,
  Lightbulb,
  Star,
  ChartLineUp,
  Gear,
} from 'phosphor-react';

// All icons below use duotone by default, but use fill if props.selected is true

type IconProps = React.ComponentProps<typeof House> & { selected?: boolean };

export const HomeIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <House weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const AboutIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <UserCircle weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const WorkIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <Briefcase weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const StudiesIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <BookOpen weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const ContactIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <EnvelopeSimple weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const ChatIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <ChatCircleText weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const MapIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <MapTrifold weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const ClearIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <X weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const ArrowRightIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <ArrowRight weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const LightbulbIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <Lightbulb weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const StarIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <Star weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const ProgressIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <ChartLineUp weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
export const SettingsIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref: ForwardedRef<SVGSVGElement>) => {
  const { selected, ...rest } = props;
  return <Gear weight={selected ? 'fill' : 'duotone'} ref={ref} {...rest} />;
});
