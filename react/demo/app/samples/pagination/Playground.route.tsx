import {Pagination, WidgetsDefaultConfig} from '@agnos-ui/react';
import {useHashChange} from '../../utils';

const PaginationDemo = () => {
	const {config, props} = useHashChange();

	return (
		<WidgetsDefaultConfig pagination={config}>
			<Pagination {...props} />
		</WidgetsDefaultConfig>
	);
};
export default PaginationDemo;
