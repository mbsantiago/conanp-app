import { createMuiTheme } from '@material-ui/core/styles';


// Material UI theme
// Mainly here to address typography deprecation issues
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#439889',
      main: '#00695c',
      dark: '#003d33',
      contrastText: '#fff',
    },
    secondary: {
      light: '#d7ffd9',
      main: '#a5d6a7',
      dark: '#75a478',
      contrastText: '#000',
    },
  },
});


// Material UI classes
const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    display: 'flex',
    height: "100%",
    width: "100%",
  },
  list: {
    overflow: 'auto',
    width: '100%',
    maxHeight: '50vh',
  },
  fullWidth: {
    width: '100%'
  },
  button: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  form: {
    display: 'flex',
    flexGrow: 1,
    width: '100%'
  },
  input: {
    margin: theme.spacing.unit,
  },
  overflow: {overflow: 'visible'},
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  flexGrow: {
    flexGrow: 1,
  },
});


export { theme, styles };
