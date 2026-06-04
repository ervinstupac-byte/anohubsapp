import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';
import { useState } from 'react';

const meta: Meta<typeof FileUpload> = {
  title: 'Shared/UI/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

const Demo = ({ ...args }) => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="max-w-lg">
      <FileUpload
        {...args}
        onFileSelect={setFiles}
      />
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-slate-300">Selected files:</h4>
          <ul className="mt-2 text-sm text-slate-400">
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Upload your files',
  },
};

export const AcceptImages: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Upload images',
    accept: 'image/*',
  },
};

export const Multiple: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    label: 'Upload multiple files',
    multiple: true,
  },
};
