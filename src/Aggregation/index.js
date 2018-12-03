import React from 'react';
import AppComponent, { styles } from '../AppComponent';
import { withStyles } from '@material-ui/core/styles';


class AggregationComponent extends AppComponent {

  renderContent() {

    return <div> Agregación de datos </div>;

  }

}


export default withStyles(styles, { withTheme: true })(AggregationComponent);
