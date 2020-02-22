import React , {useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import Context from '../context';
import SignOut from '../components/Auth/Signout';
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery';
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
import MapIcon from "@material-ui/icons/Map";
// import Typography from "@material-ui/core/Typography";

const Header = ({ classes }) => {
  const {state} = useContext(Context)
  const {currentUser} = state
  const mobileSize = useMediaQuery('(max-width:650px)')
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.grow}>
              <MapIcon className={classes.icon}>
                <Typography className={mobileSize ? classes.mobile: "" }
                component="h1"
                variant="h6"
                color="inherit"
                noWrap>
                    Pin Maps
                </Typography>    
              </MapIcon>
          </div>
          {currentUser&&(
            <div className={classes.grow}>
                <img
                className={classes.picture}
                src={currentUser.picture}
                alt={currentUser.name}
                />
                <Typography className={mobileSize ? classes.mobile: "" }
                variant="h5"
                color="inherit"
                noWrap>
                  {currentUser.name}
                </Typography>
            </div>
          )}
          <SignOut/>
        </Toolbar>
      </AppBar>
    </div>
  )
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center"
  },
  icon: {
    marginRight: theme.spacing.unit,
    color: "white",
    fontSize: 45
  },
  mobile: {
    display: "none"
  },
  picture: {
    height: "40px",
    borderRadius: "90%",
    marginRight: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(Header);
