import CustomTextEditor from '@/components/RichTextEditor/CustomTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRequest } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { isInvalid } from '@/utils/utils';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateArticle = () => {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    const navigate = useNavigate();
    const { post } = useRequest();

    const createArticle = async () => {
        return await post('/article', { title, description, content });
    };

    // Destructured 'isPending' to handle the button loading state
    const { mutate, isPending } = useMutation({
        mutationKey: ['createArticle'],
        mutationFn: createArticle,
        onSuccess: data => {
            console.log('Article created successfully', data);
            showToast({
                title: 'Success',
                description: 'Article created successfully!',
                variant: 'default', // Might want to change to a success color if your toast supports it
            });
            setTitle('');
            setDescription('');
            setContent('');

            navigate(`/article/${data.data.id}`);
        },
        onError: error => {
            console.error('Error creating article', error);
            showToast({
                title: 'Error',
                description: 'Failed to create article.',
                variant: 'destructive',
            });
        },
    });

    const validateAndCreate = () => {
        if (isInvalid(title) || isInvalid(content)) {
            showToast({
                title: 'Validation Error',
                description: 'Title and content are required fields.',
                variant: 'destructive',
            });
            return;
        }

        mutate();
    };

    return (
        // 1. Removed the hardcoded 'dark' class.
        // 2. Added max-w-5xl so the editor doesn't stretch endlessly on huge monitors.
        <div className="flex flex-col w-full items-center max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 transition-colors">
                {!isInvalid(title) ? title : 'Create New Article'}
            </h1>

            {/* Added a frosted-glass card wrapper to make the form look premium */}
            <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-card/60 border border-border shadow-sm transition-colors">
                <div className="space-y-2">
                    <label
                        htmlFor="article_title"
                        className="text-sm font-medium text-foreground ml-1"
                    >
                        Article Title
                    </label>
                    <Input
                        id="article_title"
                        placeholder="Enter the title of your article..."
                        // Removed inline styles, using Tailwind h-14 for a nice chunky input
                        className="h-14 text-lg bg-background border-input focus-visible:ring-primary"
                        onChange={e => setTitle(e.target.value)}
                        value={title}
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="article_desc"
                        className="text-sm font-medium text-foreground ml-1"
                    >
                        Short Description
                    </label>
                    <Textarea
                        id="article_desc"
                        placeholder="Write a brief summary of what this article is about..."
                        // Using Tailwind for height and preventing manual resizing which breaks layouts
                        className="h-[120px] resize-none bg-background border-input focus-visible:ring-primary"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">
                        Article Content
                    </label>
                    {/* Wrapped the editor in a border to ensure it maps to the theme */}
                    <div className="w-full rounded-xl overflow-hidden border border-input bg-background min-h-[400px]">
                        <CustomTextEditor
                            onEditorChange={e => setContent(e)}
                            value={content}
                        />
                    </div>
                </div>

                <div className="w-full flex justify-end pt-4 border-t border-border mt-4">
                    <Button
                        size="lg"
                        onClick={validateAndCreate}
                        disabled={isPending}
                        className="font-semibold px-8"
                    >
                        {isPending ? 'Publishing...' : 'Publish Article'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateArticle;
