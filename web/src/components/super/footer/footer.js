import React, { Component } from 'react';
import style from './footer.module.css';

class Footer extends React.Component{

	constructor(props){
		super(props);
		this.state = {
		}
	}
	render(){
		return (
			<div className = {style.wrapper}>
				<p>Please cite the following papers for using mRNALoc: </p>
				<p> Wang, D., et al. (2017) mRNALoc: a deep-learning framework for general and kinase-specific phosphorylation site prediction, Bioinformatics, 33(24), 3909-3916.</p>
				<p> Wang, D., et al. (2019) Capsule network for protein post-translational modification site prediction, Bioinformatics, 35(14), 2386-2394.</p>

			</div>
		)
	}
}


export default Footer
