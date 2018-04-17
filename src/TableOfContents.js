import React from 'react';

export default class extends React.PureComponent {

	render() {
		return <ol className="table-of-contents">
			{this.props.toc.map(({id, title}, idx) =>
				<li key={idx}><a href={`#${id}`}>{title}</a></li>)}
		</ol>
	}
}
