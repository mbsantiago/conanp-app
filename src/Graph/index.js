import React from 'react';
import AppComponent, { styles } from '../AppComponent';
import { withStyles } from '@material-ui/core/styles';


class GraphComponent extends AppComponent {
  renderContent() {
    return <div> Graph </div>;
  }
}


export default withStyles(styles, { withTheme: true })(GraphComponent);
