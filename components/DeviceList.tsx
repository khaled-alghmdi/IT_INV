import { Device } from "@/lib/types";
import { Edit2, Trash2, Monitor, HardDrive } from "lucide-react";

interface DeviceListProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
}

const DeviceList = ({ devices, onEdit, onDelete }: DeviceListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-100 text-green-800 border-green-200";
      case "available":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not_working":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned";
      case "available":
        return "Available";
      case "not_working":
        return "Not Working";
      default:
        return status;
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type.toLowerCase().includes("monitor")) {
      return <Monitor className="w-5 h-5 text-gray-500" />;
    }
    return <HardDrive className="w-5 h-5 text-gray-500" />;
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No devices found</p>
        <p className="text-gray-400 text-sm mt-2">
          Add your first device to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand / Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.device_type)}
                    <span className="text-sm font-medium text-gray-900">
                      {device.device_type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-mono">
                    {device.asset_number}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-mono">
                    {device.serial_number}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="text-gray-900">{device.brand || "-"}</div>
                    <div className="text-gray-500">{device.model || "-"}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                      device.status
                    )}`}
                  >
                    {getStatusLabel(device.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {device.assigned_to || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(device)}
                      className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all shadow-sm hover:shadow"
                      aria-label={`Edit ${device.asset_number}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(device.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all shadow-sm hover:shadow"
                      aria-label={`Delete ${device.asset_number}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceList;

