import React from 'react';
import { useCallback, useState } from 'react';

import { Tree, Icon } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { Action, useGraph } from '../../../core';
import nodePathHelper from '../../../helpers/nodePathHelper';
import NodeTypeChildTreeNode from './NodeTypeChildTreeNode';

interface NodeTypeTreeNodeProps {
    nodeType: NodeTypeConfiguration;
    level?: number;
    icon?: string;
}

const NodeTypeTreeNode: React.FC<NodeTypeTreeNodeProps> = ({ nodeType, level = 1 }) => {
    const { name, configuration, usageCount, usageCountByInheritance, warnings } = nodeType;
    const [collapsed, setCollapsed] = useState(true);
    const { selectedNodeTypeName, dispatch } = useGraph();

    const hasError = false;
    const hasChildren = Object.keys(configuration.childNodes).length > 0;
    const nodePath = nodePathHelper.resolveFromType(nodeType);
    const usageCountSum = Object.values(usageCountByInheritance).reduce((carry, usage) => carry + usage, 0);

    const handleSelectNode = useCallback(() => {
        setCollapsed(false);
        dispatch({ type: Action.SelectNodeType, payload: name });
    }, [name, setCollapsed, dispatch]);

    const icon = (
        <Icon
            icon={configuration.ui.icon || 'question'}
            color={
                warnings.length > 0 || configuration.options['Shel.NodeTypes.Analyzer']?.deprecated ? 'warn' : 'default'
            }
        />
    );

    const tooltip = configuration.ui.label || name + (warnings.length > 0 ? ` (${warnings.length} warnings)` : '');

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeTypeName === name}
                isCollapsed={collapsed}
                isFocused={selectedNodeTypeName === name}
                isLoading={false}
                hasError={hasError}
                label={`${nodePath.split('.').pop()} (${usageCount + usageCountSum})`}
                title={tooltip}
                customIconComponent={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleSelectNode}
                hasChildren={hasChildren}
            />
            {!collapsed &&
                hasChildren &&
                Object.keys(configuration.childNodes).map((childNodeName) => (
                    <NodeTypeChildTreeNode
                        key={childNodeName}
                        nodeTypeName={name}
                        name={childNodeName}
                        level={level + 1}
                        type={configuration.childNodes[childNodeName].type}
                        onClick={() => handleSelectNode()}
                    />
                ))}
        </Tree.Node>
    );
};
export default React.memo(NodeTypeTreeNode);
