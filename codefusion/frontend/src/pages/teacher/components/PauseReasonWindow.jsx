import { useState } from 'react';

function Window({  visible = false, onSubmit, onCancel }) {
    const [reason, setReason] = useState("Security Violation Detected");

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black opacity-40"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6 mx-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Provide reason</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = reason.trim();
                        if (!trimmed) return;
                        onSubmit && onSubmit(trimmed);
                    }}
                >
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Please provide the reason:
                    </label>
                    <textarea
                        id="reason"
                        name="reason"
                        rows="4"
                        value={reason}
                        onClick={(e)=> e.target.select()}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your reason here..."
                        required
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Window;
