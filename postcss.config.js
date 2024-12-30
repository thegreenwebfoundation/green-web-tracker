import postcssJitProps from 'postcss-jit-props';
import OpenProps from 'open-props';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [postcssJitProps(OpenProps), autoprefixer]
};