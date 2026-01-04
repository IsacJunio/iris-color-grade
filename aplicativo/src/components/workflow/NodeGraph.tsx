import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  Node, 
  Edge,
  useNodesState, 
  useEdgesState, 
  MarkerType,
  NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Layers, Image as ImageIcon, Sparkles, TrendingUp, Palette, Scissors, Trash2 } from 'lucide-react';
import { Layer } from '../../types/Layer';

// Custom Node Component to look professional
const CustomNode = ({ data, selected }: { data: any, selected: boolean }) => {
  const canDelete = data.onDelete && data.canDelete;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);

  // Sync label if updated externally
  useEffect(() => {
    setEditValue(data.label);
  }, [data.label]);

  const handleSubmit = () => {
    if (editValue.trim() && editValue !== data.label) {
       data.onRename?.(editValue);
    } else {
       setEditValue(data.label); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
        setEditValue(data.label);
        setIsEditing(false);
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-md bg-neutral-800 border-2 min-w-[150px] transition-all relative group ${
      selected ? 'border-orange-500 shadow-orange-500/20' : 'border-neutral-600 hover:border-neutral-500'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-neutral-400 !w-3 !h-3" />
      
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete();
          }}
          className="absolute -top-2 -right-2 p-1 bg-red-600/90 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
          title="Excluir camada"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${data.isInput ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
           {data.icon || <Layers size={16} />}
        </div>
        <div className="flex flex-col min-w-[80px]">
          {isEditing ? (
             <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="text-sm font-bold text-gray-200 bg-neutral-900 border border-blue-500 rounded px-1 outline-none w-full"
                onClick={(e) => e.stopPropagation()} // Prevent node selection while clicking input
             />
          ) : (
             <span 
                className="text-sm font-bold text-gray-200 cursor-text hover:text-white hover:underline decoration-dashed underline-offset-4"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!data.isInput && data.id !== 'output') setIsEditing(true);
                }}
                title="Duplo clique para renomear"
             >
                {data.label}
             </span>
          )}
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{data.subLabel}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-neutral-400 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface NodeGraphProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onReorderLayers: (layers: Layer[]) => void;
  onRemoveLayer?: (id: string) => void;
  onRenameLayer?: (id: string, newName: string) => void;
}

export function NodeGraph({ layers, selectedLayerId, onSelectLayer, onReorderLayers, onRemoveLayer, onRenameLayer }: NodeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync Layers -> Nodes
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // 1. Source Node (Imagem Original)
    newNodes.push({
      id: 'source',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: { label: 'Source', subLabel: 'Input', isInput: true, icon: <ImageIcon size={16} /> },
      selectable: false,
    });

    let lastId = 'source';
    let xPos = 250;

    // 2. Layer Nodes
    layers.forEach((layer, index) => {
      const isSelected = layer.id === selectedLayerId;
      
      let icon = <Layers size={16} />;
      if (layer.type === 'curvas') icon = <TrendingUp size={16} />;
      if (layer.type === 'cor') icon = <Palette size={16} />;
      if (layer.type === 'efeitos') icon = <Sparkles size={16} />;
      if (layer.type === 'selecao') icon = <Scissors size={16} />;

      newNodes.push({
        id: layer.id,
        type: 'custom',
        position: { x: xPos + (index * 200), y: 100 }, // Linear layout
        data: { 
          label: layer.name, 
          subLabel: layer.visible ? (layer.opacity * 100).toFixed(0) + '%' : 'HIDDEN',
           icon: icon,
          onDelete: onRemoveLayer ? () => onRemoveLayer(layer.id) : undefined,
          onRename: onRenameLayer ? (newName: string) => onRenameLayer(layer.id, newName) : undefined,
          id: layer.id,
          canDelete: layers.length > 1
        },
        selected: isSelected,
      });

      // Edge from prev to current
      newEdges.push({
        id: `e-${lastId}-${layer.id}`,
        source: lastId,
        target: layer.id,
        animated: true,
        style: { stroke: '#525252', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#525252' },
      });

      lastId = layer.id;
    });

    // 3. Output Node
    newNodes.push({
        id: 'output',
        type: 'output',
        position: { x: xPos + (layers.length * 200) + 200, y: 100 },
        data: { label: 'Output' },
        style: { backgroundColor: '#171717', color: '#fff', border: '1px solid #404040', width: 100 },
        selectable: false
    });
    
    // Edge from last layer to output
    newEdges.push({
        id: `e-${lastId}-output`,
        source: lastId,
        target: 'output',
        animated: true,
        style: { stroke: '#525252', strokeWidth: 2 },
    });

    // Merge with current positions if dragging? 
    // For simplicity, we force layout on sync unless we implement complex state merging.
    // To allow dragging, we should only update if layers.length changed or meaningful data changed.
    
    setNodes(prev => {
        // Simple strategy: Update data/selection, keep positions if ID exists
        return newNodes.map(n => {
            const existing = prev.find(p => p.id === n.id);
            if (existing) {
                return { ...n, position: existing.position }; // Keep dragged pos
            }
            return n;
        });
    });
    setEdges(newEdges);

  }, [layers, selectedLayerId, setNodes, setEdges]); // Dep on layers length?

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    if (node.id !== 'source' && node.id !== 'output') {
        onSelectLayer(node.id);
    }
  }, [onSelectLayer]);

  const onNodeDragStop: NodeMouseHandler = useCallback((_, node) => {
      // Reorder logic based on X position
      // 1. Get all layer nodes (exclude source/output)
      if (node.id === 'source' || node.id === 'output') return;

      const currentNodes = nodes.filter(n => n.id !== 'source' && n.id !== 'output');
      // Sort by X
      const sorted = [...currentNodes].sort((a, b) => a.position.x - b.position.x);
      
      // Map back to layers
      const newOrderIds = sorted.map(n => n.id);
      
      // Check if order changed
      const currentOrderIds = layers.map(l => l.id);
      if (JSON.stringify(newOrderIds) !== JSON.stringify(currentOrderIds)) {
          // Recreate layers array in new order
          const reorderedLayers = newOrderIds.map(id => layers.find(l => l.id === id)!);
          onReorderLayers(reorderedLayers);
      }
  }, [nodes, layers, onReorderLayers]);

  return (
    <div className="w-full h-full bg-neutral-900 !font-sans">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={16} size={1} color="#333" />
        <Controls className="!bg-neutral-800 !border-neutral-700 !fill-gray-400" />
      </ReactFlow>
    </div>
  );
}
