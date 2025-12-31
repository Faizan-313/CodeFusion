import toast from 'react-hot-toast';

const ImageUploadComponent = ({questions, setQuestions, index}) => {

    const getImageFileName = (img, index) => {
        if (!img) return "";
        return typeof img === 'string' ? `image-${index + 1}` : img.name || "image";
    };

    const getImageSizeText = (img) => {
        if (!img) return null;
        if (typeof img === 'string') {
            const parts = img.split(',');
            const b64 = parts[1] || '';
            const sizeBytes = Math.ceil((b64.length * 3) / 4);
            return `Size: ${(sizeBytes / 1024).toFixed(2)} KB`;
        }
        if (img.size) return `Size: ${(img.size / 1024).toFixed(2)} KB`;
        return null;
    };

    const handleFileSelect = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            // Create preview URL and revoke previous blob url if present
            const previewUrl = URL.createObjectURL(file);
            const updatedQuestions = [...questions];
            const prevPreview = updatedQuestions[index]?.imagePreview;
            if (prevPreview && typeof prevPreview === 'string' && prevPreview.startsWith('blob:')) {
                try { URL.revokeObjectURL(prevPreview); } catch (e) { /* ignore */ }
            }

            updatedQuestions[index] = {
                ...updatedQuestions[index],
                image: file,
                imagePreview: previewUrl
            };
            setQuestions(updatedQuestions);
        }
    };

    const handleRemove = (index) => {
        const updatedQuestions = [...questions];
        const prev = updatedQuestions[index]?.imagePreview;
        if (prev && typeof prev === 'string' && prev.startsWith('blob:')) {
            try { URL.revokeObjectURL(prev); } catch (e) {}
        }
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            image: null,
            imagePreview: null
        };
        setQuestions(updatedQuestions);
    };

    const question = questions?.[index];
    if (!question) return null;

    return (
        <div className="bg-gradient-to-br from-slate-50 to-[#9ec8b9] p-4 rounded-lg">
            <div className="max-w-full">
                <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                    <label htmlFor={`fileUpload-${index}`} className="block text-sm font-semibold text-gray-700 mb-4">
                        Upload Question Image (Optional)
                    </label>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="file"
                            id={`fileUpload-${index}`}
                            accept="image/*"
                            onChange={(e) => handleFileSelect(index, e)}
                            className="flex-1 text-sm text-gray-600 file:mr-2 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#9ec8b9] file:text-[#092635] file:font-medium hover:file:bg-[#9ec8b9] file:cursor-pointer transition"
                        />
                    </div>

                    {question.imagePreview ? (
                        <div className="bg-gradient-to-br from-[#9ec8b9] to-[#5c8374] border-2 border-[#9ec8b9] rounded-lg p-4">
                            <div className="flex items-start gap-4">
                                <img
                                    src={question.imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-[#9ec8b9] shadow-md"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#092635] mb-1">✓ Image Selected</p>
                                    <p className="text-xs text-gray-600 mb-1">{getImageFileName(question.image, index)}</p>
                                    {getImageSizeText(question.image) && (
                                        <p className="text-xs text-gray-500 mb-3">{getImageSizeText(question.image)}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-xs font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-sm text-gray-600 font-medium mb-1">No image uploaded</p>
                            <p className="text-xs text-gray-500">Supported formats: JPG, PNG (Max 2MB)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUploadComponent;