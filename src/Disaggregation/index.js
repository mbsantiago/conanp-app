import React from 'react';
import AppComponent, { styles } from '../AppComponent';
import { withStyles } from '@material-ui/core/styles';


class DisaggregationComponent extends AppComponent {

  renderContent() {

    return <div> Desagregación </div>;

  }

}


export default withStyles(styles, { withTheme: true })(DisaggregationComponent);
